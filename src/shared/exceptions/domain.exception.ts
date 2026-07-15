export class DomainException extends Error {}

export class UnauthorizedException extends DomainException {}

export class ConflictException extends DomainException {}

export class NotFoundException extends DomainException {}
