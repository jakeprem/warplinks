defmodule Warplinks.LinkEngine do
  alias Warplinks.Link
  alias Warplinks.LinkEngine.{LiquidExecutor, LuaExecutor}
  alias Warplinks.Repo

  defmodule Context do
    defstruct [:conn, :captures, :link, :__version__]

    def build(conn, captures) do
      %__MODULE__{
        __version__: 1,
        conn: %{
          request_path: conn.request_path,
          path_pieces: conn.params["path"],
          query_string: conn.query_string,
          query_params: conn.query_params
        },
        captures: captures,
        link: :not_loaded
      }
    end

    def merge_link(%Context{} = ctx, link) do
      %{
        ctx
        | link: %{
            destination: link.destination,
            data: link.data
          }
      }
    end
  end

  def build_redirect_url(%Context{} = ctx, %Link{type: :liquid} = link) do
    LiquidExecutor.evaluate(ctx, link)
  end

  def build_redirect_url(%Context{} = ctx, %Link{type: :lua} = link) do
    LuaExecutor.evaluate(ctx, link)
  end

  def build_redirect_url(
        %Context{
          conn: %{path_pieces: [_key | path]}
        },
        %Link{destination: destination}
      ) do
    redirect_url =
      Enum.reduce(path, destination, fn piece, acc ->
        String.replace(acc, "%s", piece, global: false)
      end)

    {:ok, redirect_url}
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
