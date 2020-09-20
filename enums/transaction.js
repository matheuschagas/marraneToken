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

const TransactionErrors = {
    INVALID_TERMINAL: 'Terminal inválido',
    TERMINAL_NOT_FOUND: 'Terminal não encontrado',
    TRANSACTION_NOT_FOUND_OR_EXPIRED: 'Transação não encontrada ou já expirou',
    TRANSACTION_NOT_FOUND: 'Transação não encontrada',
    INVALID_OTP: 'OTP inválido',
    INVALID_REQUEST: 'Requisição no formato incorreto',
    UNEXPECTED_ERROR: 'Ocorreu um erro inesperado'

}

module.exports.TransactionStatus = TransactionStatus;
module.exports.TransactionErrors = TransactionErrors;
