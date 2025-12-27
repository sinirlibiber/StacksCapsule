;; Stacks Capsule - Decentralized Time-Locked Assets on Bitcoin
;; A smart contract for creating time-locked STX transfers using Bitcoin block heights

;; ==================== Constants ====================

;; Error codes
(define-constant ERR_NOT_AUTHORIZED (err u101))
(define-constant ERR_NOT_REACHED (err u102))
(define-constant ERR_ALREADY_CLAIMED (err u103))
(define-constant ERR_INVALID_AMOUNT (err u104))
(define-constant ERR_INVALID_BLOCK (err u105))
(define-constant ERR_CAPSULE_NOT_FOUND (err u106))
(define-constant ERR_TRANSFER_FAILED (err u107))

;; Contract owner
(define-constant CONTRACT_OWNER tx-sender)

;; ==================== Data Variables ====================

;; Capsule ID counter
(define-data-var capsule-id-nonce uint u0)

;; ==================== Data Maps ====================

;; Main capsule storage
(define-map capsules
    { id: uint }
    {
        sender: principal,
        recipient: principal,
        amount: uint,
        release-block: uint,
        status: (string-ascii 10),
        memo: (string-utf8 256),
        created-at: uint
    }
)

;; Track capsules by sender
(define-map sender-capsules
    { sender: principal }
    { capsule-ids: (list 50 uint) }
)

;; Track capsules by recipient
(define-map recipient-capsules
    { recipient: principal }
    { capsule-ids: (list 50 uint) }
)

;; ==================== Private Functions ====================

;; Get next capsule ID
(define-private (get-next-id)
    (let ((current-id (var-get capsule-id-nonce)))
        (var-set capsule-id-nonce (+ current-id u1))
        current-id
    )
)

;; Add capsule ID to sender's list
(define-private (add-to-sender-list (sender principal) (capsule-id uint))
    (let (
        (current-list (default-to { capsule-ids: (list) } (map-get? sender-capsules { sender: sender })))
    )
        (map-set sender-capsules
            { sender: sender }
            { capsule-ids: (unwrap-panic (as-max-len? (append (get capsule-ids current-list) capsule-id) u50)) }
        )
    )
)

;; Add capsule ID to recipient's list
(define-private (add-to-recipient-list (recipient principal) (capsule-id uint))
    (let (
        (current-list (default-to { capsule-ids: (list) } (map-get? recipient-capsules { recipient: recipient })))
    )
        (map-set recipient-capsules
            { recipient: recipient }
            { capsule-ids: (unwrap-panic (as-max-len? (append (get capsule-ids current-list) capsule-id) u50)) }
        )
    )
)

;; ==================== Public Functions ====================

;; Lock STX in a time capsule
;; @param recipient: The principal who can claim the STX after release-block
;; @param amount: Amount of STX to lock (in microSTX)
;; @param release-block: Bitcoin block height when the capsule can be claimed
;; @param memo: A message attached to the capsule
(define-public (lock-stx 
    (recipient principal) 
    (amount uint) 
    (release-block uint) 
    (memo (string-utf8 256))
)
    (let (
        (capsule-id (get-next-id))
        (current-block burn-block-height)
    )
        ;; Validate amount
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        
        ;; Validate release block is in the future
        (asserts! (> release-block current-block) ERR_INVALID_BLOCK)
        
        ;; Transfer STX to contract
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        ;; Store capsule data
        (map-set capsules
            { id: capsule-id }
            {
                sender: tx-sender,
                recipient: recipient,
                amount: amount,
                release-block: release-block,
                status: "open",
                memo: memo,
                created-at: current-block
            }
        )
        
        ;; Update tracking lists
        (add-to-sender-list tx-sender capsule-id)
        (add-to-recipient-list recipient capsule-id)
        
        ;; Return the new capsule ID
        (ok capsule-id)
    )
)

;; Claim STX from an unlocked capsule
;; @param id: The capsule ID to claim
(define-public (claim-stx (id uint))
    (let (
        (capsule (unwrap! (map-get? capsules { id: id }) ERR_CAPSULE_NOT_FOUND))
        (current-block burn-block-height)
    )
        ;; Verify caller is the designated recipient
        (asserts! (is-eq tx-sender (get recipient capsule)) ERR_NOT_AUTHORIZED)
        
        ;; Verify capsule hasn't been claimed
        (asserts! (is-eq (get status capsule) "open") ERR_ALREADY_CLAIMED)
        
        ;; Verify release block has been reached
        (asserts! (>= current-block (get release-block capsule)) ERR_NOT_REACHED)
        
        ;; Transfer STX from contract to recipient
        (try! (as-contract (stx-transfer? (get amount capsule) tx-sender (get recipient capsule))))
        
        ;; Update capsule status
        (map-set capsules
            { id: id }
            (merge capsule { status: "claimed" })
        )
        
        (ok true)
    )
)

;; ==================== Read-Only Functions ====================

;; Get capsule information by ID
(define-read-only (get-capsule-info (id uint))
    (map-get? capsules { id: id })
)

;; Get current Bitcoin block height
(define-read-only (get-current-block)
    burn-block-height
)

;; Get total number of capsules created
(define-read-only (get-total-capsules)
    (var-get capsule-id-nonce)
)

;; Get all capsule IDs for a sender
(define-read-only (get-sender-capsules (sender principal))
    (default-to { capsule-ids: (list) } (map-get? sender-capsules { sender: sender }))
)

;; Get all capsule IDs for a recipient
(define-read-only (get-recipient-capsules (recipient principal))
    (default-to { capsule-ids: (list) } (map-get? recipient-capsules { recipient: recipient }))
)

;; Check if a capsule is claimable
(define-read-only (is-claimable (id uint))
    (let (
        (capsule (map-get? capsules { id: id }))
    )
        (match capsule
            cap (and 
                (is-eq (get status cap) "open")
                (>= burn-block-height (get release-block cap))
            )
            false
        )
    )
)

;; Get blocks remaining until capsule unlock
(define-read-only (get-blocks-remaining (id uint))
    (let (
        (capsule (map-get? capsules { id: id }))
    )
        (match capsule
            cap (if (>= burn-block-height (get release-block cap))
                u0
                (- (get release-block cap) burn-block-height)
            )
            u0
        )
    )
)

;; Calculate estimated time remaining in minutes (assuming 10-min blocks)
(define-read-only (get-estimated-minutes-remaining (id uint))
    (* (get-blocks-remaining id) u10)
)

