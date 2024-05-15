defmodule Warplinks.LinkServer do
  use GenServer

  alias PathRouter
  alias Warplinks.{Link, Links}

  @partition_supervisor_name __MODULE__.PartitionSupervisor

  def partition_supervisor_conf do
    {PartitionSupervisor,
     child_spec: __MODULE__.child_spec(nil), name: @partition_supervisor_name}
  end

  def start_link(_nil) do
    GenServer.start_link(__MODULE__, nil)
  end

  def add_link(%Link{id: id, key: key}) do
    for {_id, pid, _type, _modules} <-
          PartitionSupervisor.which_children(@partition_supervisor_name) do
      GenServer.call(pid, {:add_link, key, id})
    end
  end

  def find_link(path) do
    GenServer.call(via(), {:find_link, path})
  end

  defp via, do: {:via, PartitionSupervisor, {@partition_supervisor_name, self()}}
  # ----
  # Server callbacks
  # ----
  def init(_) do
    router = PathRouter.new()

    for link <- Links.all_links() do
      PathRouter.add_route(router, link.key, link.id)
    end

    {:ok, router}
  end

  def handle_call({:add_link, key, id}, _from, router) do
    PathRouter.add_route(router, key, id)
    {:reply, :ok, router}
  end

  def handle_call({:find_link, path}, _from, router) do
    {:reply, PathRouter.match_route(router, path), router}
  end
end
