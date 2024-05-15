defmodule Warplinks.LinkEngine do
  alias Warplinks.Link
  alias Warplinks.LinkEngine.{LiquidExecutor, LuaExecutor}
  alias Warplinks.Repo

  defmodule Context do
    defstruct [:request_path, :path_pieces, :query_string, :query_params]

    def new(conn) do
      %__MODULE__{
        request_path: conn.request_path,
        path_pieces: conn.params["path"],
        query_string: conn.query_string,
        query_params: conn.query_params
      }
    end
  end

  def build_redirect_url(%Context{} = ctx, %Link{type: :liquid} = link) do
    case LiquidExecutor.evaluate(ctx, link) do
      {:ok, destination} -> destination
      _ -> raise "Invalid destination"
    end
  end

  def build_redirect_url(%Context{} = ctx, %Link{type: :lua} = link) do
    case LuaExecutor.evaluate(ctx, link) do
      {:ok, destination} -> destination
      _ -> raise "Invalid destination"
    end
  end

  def build_redirect_url(%{path_pieces: path}, link) do
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
