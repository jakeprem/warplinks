defmodule WarplinksWeb.RedirectController do
  use WarplinksWeb, :controller

  alias Warplinks.Links
  alias Warplinks.LinkEngine

  def execute(conn, %{"key" => key, "path" => path}) do
    case Links.get_by_key(key) do
      nil ->
        conn
        |> put_flash(:error, "Link not found")
        |> redirect(to: ~p"/")

      link ->
        LinkEngine.increment_views_async(link)
        redirect_url = LinkEngine.build_redirect_url(link, path)

        redirect(conn, external: redirect_url)
    end
  end
end
