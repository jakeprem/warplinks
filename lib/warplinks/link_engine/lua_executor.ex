defmodule Warplinks.LinkEngine.LuaExecutor do
  alias Warplinks.Link
  alias Warplinks.LinkEngine.Context

  def evaluate(%Context{} = ctx, %Link{type: :lua, template: template} = link) do
    ctx = Context.merge_link(ctx, link)

    case do_execute_lua(template, ctx) do
      {[destination], _} -> {:ok, destination}
      _ -> {:error, "Invalid destination"}
    end
  end

  def evaluate(_, _), do: {:error, "expected Lua link"}

  defp do_execute_lua(template, ctx) do
    Lua.new()
    |> Lua.set!([:ctx], ctx)
    |> Lua.eval!(template)
  end
end
