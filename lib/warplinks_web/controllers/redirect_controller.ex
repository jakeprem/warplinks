defmodule WarplinksWeb.RedirectController do
  use WarplinksWeb, :controller

  alias Warplinks.Link
  alias Warplinks.Links
  alias Warplinks.LinkEngine
  alias Warplinks.LinkEngine.Context
  alias Warplinks.LinkServer

  def execute(conn, %{"path" => [key | _]}) do
    with {id, captures} <-
           LinkServer.find_link(conn.request_path),
         %Link{} = link <- Links.get_link(id) do
      LinkEngine.increment_views_async(link)

      case do_build_redirect_url(conn, captures, link) do
        {:ok, destination} ->
          redirect(conn, external: destination)

        _ ->
          conn |> put_flash(:error, "Invalid destination") |> redirect(to: "/links")
      end
    else
      _ ->
        conn
        |> put_flash(:error, "Link not found")
        |> redirect(to: ~p"/links/new?key=#{key}")
    end
  end

  defp do_build_redirect_url(conn, captures, link) do
    conn
    |> Context.build(captures)
    |> Context.merge_link(link)
    |> LinkEngine.build_redirect_url(link)
  end
end
