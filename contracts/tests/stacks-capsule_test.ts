import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';
import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that STX can be locked in a capsule",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const amount = 1000000; // 1 STX in microSTX
        const releaseBlock = 100;
        const memo = "Happy Birthday!";

        let block = chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'lock-stx', [
                types.principal(wallet1.address),
                types.uint(amount),
                types.uint(releaseBlock),
                types.utf8(memo)
            ], deployer.address)
        ]);

        // Check that the transaction succeeded
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk().expectUint(0); // First capsule ID is 0
        
        // Verify STX was transferred
        block.receipts[0].events.expectSTXTransferEvent(
            amount,
            deployer.address,
            `${deployer.address}.stacks-capsule`
        );
    }
});

Clarinet.test({
    name: "Ensure that capsule info can be retrieved",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const amount = 1000000;
        const releaseBlock = 100;
        const memo = "Test memo";

        // First lock some STX
        let block = chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'lock-stx', [
                types.principal(wallet1.address),
                types.uint(amount),
                types.uint(releaseBlock),
                types.utf8(memo)
            ], deployer.address)
        ]);

        // Get capsule info
        let infoBlock = chain.callReadOnlyFn(
            'stacks-capsule',
            'get-capsule-info',
            [types.uint(0)],
            deployer.address
        );

        // Verify the capsule data
        const capsule = infoBlock.result.expectSome().expectTuple();
        assertEquals(capsule['sender'], deployer.address);
        assertEquals(capsule['recipient'], wallet1.address);
        assertEquals(capsule['amount'], types.uint(amount));
        assertEquals(capsule['status'], '"open"');
    }
});

Clarinet.test({
    name: "Ensure that only recipient can claim capsule",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const amount = 1000000;
        const releaseBlock = 10;
        const memo = "Test";

        // Lock STX
        chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'lock-stx', [
                types.principal(wallet1.address),
                types.uint(amount),
                types.uint(releaseBlock),
                types.utf8(memo)
            ], deployer.address)
        ]);

        // Mine blocks to reach release block
        chain.mineEmptyBlockUntil(releaseBlock + 1);

        // Try to claim as wrong user (should fail)
        let failBlock = chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'claim-stx', [
                types.uint(0)
            ], wallet2.address)
        ]);

        failBlock.receipts[0].result.expectErr().expectUint(101); // ERR_NOT_AUTHORIZED
    }
});

Clarinet.test({
    name: "Ensure that capsule cannot be claimed before release block",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const amount = 1000000;
        const releaseBlock = 1000; // Far in the future
        const memo = "Future gift";

        // Lock STX
        chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'lock-stx', [
                types.principal(wallet1.address),
                types.uint(amount),
                types.uint(releaseBlock),
                types.utf8(memo)
            ], deployer.address)
        ]);

        // Try to claim before release block (should fail)
        let failBlock = chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'claim-stx', [
                types.uint(0)
            ], wallet1.address)
        ]);

        failBlock.receipts[0].result.expectErr().expectUint(102); // ERR_NOT_REACHED
    }
});

Clarinet.test({
    name: "Ensure that capsule can be claimed after release block",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const amount = 1000000;
        const releaseBlock = 10;
        const memo = "Claimable";

        // Lock STX
        chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'lock-stx', [
                types.principal(wallet1.address),
                types.uint(amount),
                types.uint(releaseBlock),
                types.utf8(memo)
            ], deployer.address)
        ]);

        // Mine blocks to reach release block
        chain.mineEmptyBlockUntil(releaseBlock + 1);

        // Claim the capsule
        let claimBlock = chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'claim-stx', [
                types.uint(0)
            ], wallet1.address)
        ]);

        claimBlock.receipts[0].result.expectOk().expectBool(true);

        // Verify STX was transferred to recipient
        claimBlock.receipts[0].events.expectSTXTransferEvent(
            amount,
            `${deployer.address}.stacks-capsule`,
            wallet1.address
        );
    }
});

Clarinet.test({
    name: "Ensure that capsule cannot be claimed twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const amount = 1000000;
        const releaseBlock = 10;
        const memo = "One time only";

        // Lock STX
        chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'lock-stx', [
                types.principal(wallet1.address),
                types.uint(amount),
                types.uint(releaseBlock),
                types.utf8(memo)
            ], deployer.address)
        ]);

        // Mine blocks and claim
        chain.mineEmptyBlockUntil(releaseBlock + 1);
        chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'claim-stx', [
                types.uint(0)
            ], wallet1.address)
        ]);

        // Try to claim again (should fail)
        let failBlock = chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'claim-stx', [
                types.uint(0)
            ], wallet1.address)
        ]);

        failBlock.receipts[0].result.expectErr().expectUint(103); // ERR_ALREADY_CLAIMED
    }
});

Clarinet.test({
    name: "Ensure is-claimable returns correct status",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const amount = 1000000;
        const releaseBlock = 50;
        const memo = "Check status";

        // Lock STX
        chain.mineBlock([
            Tx.contractCall('stacks-capsule', 'lock-stx', [
                types.principal(wallet1.address),
                types.uint(amount),
                types.uint(releaseBlock),
                types.utf8(memo)
            ], deployer.address)
        ]);

        // Check is-claimable before release block
        let beforeCheck = chain.callReadOnlyFn(
            'stacks-capsule',
            'is-claimable',
            [types.uint(0)],
            deployer.address
        );
        beforeCheck.result.expectBool(false);

        // Mine blocks to reach release block
        chain.mineEmptyBlockUntil(releaseBlock + 1);

        // Check is-claimable after release block
        let afterCheck = chain.callReadOnlyFn(
            'stacks-capsule',
            'is-claimable',
            [types.uint(0)],
            deployer.address
        );
        afterCheck.result.expectBool(true);
    }
});

