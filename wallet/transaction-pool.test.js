const TransactionPool = require('./transaction-pool')
const Transaction = require('./transaction')
const Wallet = require('./index')

describe('TransactionPool',()=>{
    let transactionPool, transaction, senderWallet;
    senderWallet = new Wallet();
    beforeEach(()=>{
        transactionPool = new TransactionPool();
        transaction = new Transaction({
            senderWallet,
            recipient: 'fake-recipient',
            amount: 50
        })
    })

    describe('setTransaction()',()=>{
        it('adds a transaction',()=>{
            transactionPool.setTransaction(transaction)
            expect(transactionPool.transactionMap[transaction.id])
            .toBe(transaction);
        })
    })

    describe('existingtransaction()',()=>{
        it('returns an existing transaction given an input address', ()=>{
            transactionPool.setTransaction(transaction)
            expect(
                transactionPool.existingTransaction({
                    inputAddress: senderWallet.publicKey
                })).toBe(transaction)
        })
    })
})