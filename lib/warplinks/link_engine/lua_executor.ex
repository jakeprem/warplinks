defmodule Warplinks.LinkEngine.LuaExecutor do
  alias Warplinks.Link
  alias Warplinks.LinkEngine.Context

  def evaluate(%Context{} = ctx, %Link{type: "lua"} = link) do
    ctx = %{
      link: %{
        destination: link.destination,
        data: link.data
      },
      req: ctx
    }

    case do_execute_lua(link.template, ctx) do
      {[destination], _} -> {:ok, destination}
      _ -> {:error, "Invalid destination"}
    end
  end

  def evaluate(_, _), do: {:error, "expected Lua link"}

  defp do_execute_lua(template, ctx) do
    "\nTemplate:\n#{template}\n" |> IO.puts()

    Lua.new()
    |> Lua.set!([:ctx], ctx)
    |> Lua.eval!(template)
    |> IO.inspect(label: "Evaluated Lua")
  end
end
