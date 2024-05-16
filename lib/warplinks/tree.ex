defmodule Warplinks.Tree do
  alias Warplinks.Tree

  defstruct label: "", value: nil, branches: %{}

  @type t :: %Tree{label: String.t(), value: any, branches: %{String.t() => Tree.t()}}

  @spec new() :: Tree.t()
  def new do
    %Tree{}
  end

  @spec add(Tree.t(), String.t(), any) :: Tree.t()
  def add(tree, path, value) do
    segments = String.split(path, "/", trim: true)
    add_segments(tree, segments, value, [])
  end

  defp add_segments(%Tree{} = tree, [], value, capture_labels) do
    %Tree{tree | value: {value, capture_labels}}
  end

  defp add_segments(%Tree{} = tree, [segment | rest], value, capture_labels) do
    {label, new_branch} =
      if String.starts_with?(segment, ":") do
        capture_label = String.trim_leading(segment, ":")
        branch = Map.get(tree.branches, "", %Tree{label: ""})
        new_branch = add_segments(branch, rest, value, capture_labels ++ [capture_label])
        {"", new_branch}
      else
        branch = Map.get(tree.branches, segment, %Tree{label: segment})
        new_branch = add_segments(branch, rest, value, capture_labels)
        {segment, new_branch}
      end

    updated_branches = Map.put(tree.branches, label, new_branch)
    %Tree{tree | branches: updated_branches}
  end

  @spec find(Tree.t(), String.t()) :: {any, [{String.t(), String.t()}]} | nil
  def find(tree, path) do
    segments = String.split(path, "/", trim: true)

    tree
    |> find_segments(segments, [])
    |> cleanup_remaining()
  end

  defp cleanup_remaining(nil), do: nil

  defp cleanup_remaining({value, []}) do
    {value, []}
  end

  defp cleanup_remaining({value, labels}) do
    {remaining, labels_map} =
      labels
      |> Map.new()
      |> Map.pop("_remaining")

    labels_map =
      Map.merge(labels_map, %{
        "remaining" => remaining,
        "remaining_path" => Enum.join(remaining, "/")
      })

    {value, labels_map}
  end

  defp find_segments(%Tree{} = tree, [], captured) do
    case tree.value do
      nil -> nil
      {value, labels} -> {value, Enum.zip(labels, captured)}
    end
  end

  defp find_segments(%Tree{} = tree, [segment | rest], captured) do
    exact_match =
      tree.branches
      |> Map.get(segment)
      |> maybe_find(rest, captured)

    case exact_match do
      nil ->
        prefix_match =
          tree.branches
          |> Map.get("")
          |> maybe_find(rest, captured ++ [segment])

        case prefix_match do
          nil ->
            case tree.value do
              nil ->
                nil

              {value, labels} ->
                {value, Enum.zip(labels, captured) ++ [{"_remaining", [segment | rest]}]}
            end

          match ->
            match
        end

      match ->
        match
    end
  end

  defp maybe_find(nil, _rest, _captured), do: nil
  defp maybe_find(%Tree{} = branch, rest, captured), do: find_segments(branch, rest, captured)
end
