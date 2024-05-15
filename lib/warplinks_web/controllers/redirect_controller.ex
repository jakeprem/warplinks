defmodule WarplinksWeb.RedirectController do
  use WarplinksWeb, :controller

  alias Warplinks.Links
  alias Warplinks.LinkEngine

  def execute(conn, %{"key" => key}) do
    case Links.get_by_key(key) do
      nil ->
        conn
        |> put_flash(:error, "Link not found")
        |> redirect(to: ~p"/links/new?key=#{key}")

      link ->
        LinkEngine.increment_views_async(link)

        redirect_url =
          conn
          |> LinkEngine.Context.new()
          |> LinkEngine.build_redirect_url(link)

        redirect(conn, external: redirect_url)
    end
  end
end
