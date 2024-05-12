defmodule Warplinks.LinkEngine do
  alias Warplinks.Link
  alias Warplinks.Repo

  def build_redirect_url(link, path) do
    Enum.reduce(path, link.destination, fn piece, acc ->
      String.replace(acc, "%s", piece, global: false)
    end)
  end

  def increment_views_async(link) do
    Task.Supervisor.start_child(Warplinks.TaskSupervisor, fn ->
      increment_views(link)
    end)
  end

  def increment_views(link) do
    link
    |> Link.changeset(%{views: link.views + 1})
    |> Repo.update()
  end
end
