defmodule WarplinksWeb.LinksLive.Index do
  use WarplinksWeb, :live_view

  alias Warplinks.Links
  alias Warplinks.Link

  @impl true
  def mount(_params, _session, socket) do
    {:ok, stream(socket, :links, Links.all_links(order_by: [desc: :views]))}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :edit, %{"id" => id}) do
    socket
    |> assign(:page_title, "Edit Link")
    |> assign(:link, Links.get_link!(id))
  end

  defp apply_action(socket, :new, params) do
    key = params["key"]
    name = key && String.capitalize(key)

    socket
    |> assign(:page_title, "New Link")
    |> assign(:link, %Link{key: key, name: name})
  end

  defp apply_action(socket, :index, _params) do
    socket
    |> assign(:page_title, "Listing Links")
    |> assign(:link, nil)
  end

  @impl true
  def handle_info({WarplinksWeb.LinkLive.FormComponent, {:saved, link}}, socket) do
    {:noreply, stream_insert(socket, :links, link)}
  end

  @impl true
  def handle_event("delete", %{"id" => id}, socket) do
    link = Links.get_link!(id)
    Links.delete_link!(link)

    {:noreply, stream_delete(socket, :links, link)}
  end
end
