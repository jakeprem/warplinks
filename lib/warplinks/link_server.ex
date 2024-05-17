defmodule Warplinks.LinkServer do
  use GenServer

  alias Warplinks.Tree
  alias Warplinks.{Link, Links}
  alias Warplinks.PubSub

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
    PubSub.subscribe("links")

    tree =
      for link <- Links.all_links(), reduce: Tree.new() do
        tree -> Tree.add(tree, link.key, link.id)
      end

    {:ok, tree}
  end

  def handle_call({:add_link, key, id}, _from, tree) do
    {:reply, :ok, Tree.add(tree, key, id)}
  end

  def handle_call({:find_link, path}, _from, tree) do
    {:reply, Tree.find(tree, path), tree}
  end

  def handle_info(%{topic: "links", event: "created", payload: %{"id" => id}}, tree) do
    link = Links.get_link!(id)
    {:noreply, Tree.add(tree, link.key, link.id)}
  end
end
