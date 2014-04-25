package controllers

import play.api._
import play.api.mvc._

// Forms
import play.api.data._
import play.api.data.Forms._

object Application extends Controller with Security {

    val u = "api"
    val p = "Aith5eenaiph"

    def index = isAuthenticated { implicit user => implicit request =>
        Ok(views.html.index("Your new application is ready.", Some(u), Some(p)))
    }

    def login = Action { implicit request =>

        Ok(views.html.login("Login", loginForm));
    }

    /*
        Sign in form
    */
    val loginForm = Form(
        tuple(
            "username" -> nonEmptyText,
            "password" -> nonEmptyText
        )
    )
    def loginPost = Action { implicit request =>
    loginForm.bindFromRequest.fold(
        formWithErrors => {
            BadRequest(views.html.login("Zing - Login", formWithErrors))
        },
        formData => {
            val (username, pp) = formData
            if (username == u && pp == p) {
                Redirect(routes.Application.index) withSession ("username" -> username)
            } else {
                Redirect(routes.Application.login) flashing("error" -> "The username or password you have entered is incorrect.")
            }
        }
    )
  }

  def logout    = Action { implicit request =>
    Redirect(routes.Application.login).withNewSession.flashing("success" -> "You have been logged out successfully.")
  }

}