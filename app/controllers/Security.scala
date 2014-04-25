package controllers

// For RequestHeader
import play.api.mvc._

trait Security {

    /*
        Retrieve the username
    */
    def username(request: RequestHeader): Option[String] = request.session.get( "username" )

    /*
        Redirect to login if user not authenticated
    */
    def onUnAuthenticated(request: RequestHeader) = Results.Redirect( routes.Application.login )

    /*
        Action composition for authentication
    */
    def isAuthenticated(f: => String => Request[AnyContent] => Result) = Security.Authenticated(username, onUnAuthenticated) { user =>
        Action(request => f(user)(request))
    }

}