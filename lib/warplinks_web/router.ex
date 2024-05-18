defmodule WarplinksWeb.Router do
  use WarplinksWeb, :router

  import WarplinksWeb.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {WarplinksWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:warplinks, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: WarplinksWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  ## Authentication routes

  scope "/", WarplinksWeb do
    pipe_through [:browser, :redirect_if_user_is_authenticated]

    live_session :redirect_if_user_is_authenticated,
      on_mount: [{WarplinksWeb.UserAuth, :redirect_if_user_is_authenticated}] do
      live "/user/register", UserRegistrationLive, :new
      live "/user/log_in", UserLoginLive, :new
      live "/user/reset_password", UserForgotPasswordLive, :new
      live "/user/reset_password/:token", UserResetPasswordLive, :edit
    end

    post "/user/log_in", UserSessionController, :create
  end

  scope "/", WarplinksWeb do
    pipe_through [:browser, :require_authenticated_user]

    live_session :require_authenticated_user,
      on_mount: [{WarplinksWeb.UserAuth, :ensure_authenticated}] do
      live "/user/settings", UserSettingsLive, :edit
      live "/user/settings/confirm_email/:token", UserSettingsLive, :confirm_email

      live "/links", LinksLive.Index, :index
      live "/links/new", LinksLive.Index, :new
      live "/links/:id/edit", LinksLive.Index, :edit

      live "/links/:id", LinksLive.Show, :show
      live "/links/:id/show/edit", LinksLive.Show, :edit
    end
  end

  scope "/", WarplinksWeb do
    pipe_through [:browser]

    get "/", PageController, :home

    delete "/user/log_out", UserSessionController, :delete

    live_session :current_user,
      on_mount: [{WarplinksWeb.UserAuth, :mount_current_user}] do
      live "/user/confirm/:token", UserConfirmationLive, :edit
      live "/user/confirm", UserConfirmationInstructionsLive, :new
    end
  end

  scope "/", WarplinksWeb do
    pipe_through [:browser, :require_authenticated_user]

    get "/*path", RedirectController, :execute
  end
end
