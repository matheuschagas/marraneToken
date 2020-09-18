const TransactionStatus = {
    //CREATED: 'CREATED',
    PENDING: 'PENDING', // Quando a transação é criada
    CANCELLED: 'CANCELLED', // Quando quem criou a transação a cancela
    EXPIRED: 'EXPIRED', // Quando a transação fica pendende por mais tempo que seu tempo de vida
    EXPIRING: 'EXPIRING', // Quando a transação foi direcionada para o worker para sua expiração
    APPROVED: 'APPROVED', // Quando a transação é aprovada pelo usuario usando token
    DENIED: 'DENIED', // Quando a transação é rejeitada pelo usuario usando token (indicar troca de senha?)
    FAILED: 'FAILED' // Quando as tentativas chegam a 0 a transação falha (pode ser fraude)
}

module.exports.TransactionStatus = TransactionStatus;
