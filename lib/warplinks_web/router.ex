defmodule WarplinksWeb.Router do
  use WarplinksWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {WarplinksWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", WarplinksWeb do
    pipe_through :browser

    live "/links", LinksLive.Index, :index
    live "/links/new", LinksLive.Index, :new
    live "/links/:id/edit", LinksLive.Index, :edit

    live "/links/:id", LinksLive.Show, :show
    live "/links/:id/show/edit", LinksLive.Show, :edit

    get "/", PageController, :home
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

  scope "/", WarplinksWeb do
    pipe_through :browser

    get "/*path", RedirectController, :execute
  end
end
