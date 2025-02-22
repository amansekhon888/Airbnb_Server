class ResponseHandler {
    constructor(message, data = null, statusCode = 200) {
      this.success = true;
      this.message = message;
      this.data = data;
      this.statusCode = statusCode;
    }
  
    static send(res, message = "Success", data = null, statusCode = 200) {
      return res.status(statusCode).json(new ResponseHandler(message, data, statusCode));
    }
  }
  
  export default ResponseHandler;
  