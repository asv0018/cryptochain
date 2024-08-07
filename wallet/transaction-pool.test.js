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

    describe('valid transactions()', ()=> {
        let validTransactions, errorMock;

        beforeEach(()=>{
            validTransactions = [];
            errorMock = jest.fn();
            global.console.error = errorMock;
            for(let i=0; i<10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'any-recipient',
                    amount: 30
                })
            
            if(i%3===0){
                transaction.input.amount = 999999;
            } else if(i%3===1) {
                transaction.input.signature = new Wallet().sign('foo')
            } else {
                validTransactions.push(transaction)
            }
            transactionPool.setTransaction(transaction)
        }
        })

        it('returns valid transactions', ()=>{
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        })

        it('logs errors for the invalid transactions', ()=>{
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        })
    })
})