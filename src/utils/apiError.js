class apiError extends Error{
    constructor(status,message,data={})
    {
        super(message);
        this.status=status,
        this.message=message,
        this.data=data
    }

    static unAuthorized(status=401,message="unAuthorized access",data){
        return new apiError(status,message,data)
    }

    static notFound(status=404,message="Resource not found",data){
        return new apiError(status,message,data)
    }

    static badRequest(status=400,message="Bad Request",data){
        return new apiError(status,message,data)
    }

    static serverError(status=500,message="Internal server Error",data){
        return new apiError(status,message,data)
    }
    
}

export {apiError}