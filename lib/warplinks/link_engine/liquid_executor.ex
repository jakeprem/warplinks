defmodule Warplinks.LinkEngine.LiquidExecutor do
  alias Warplinks.Link
  alias Warplinks.LinkEngine.Context

  def evaluate(%Context{} = ctx, %Link{type: :liquid, template: template} = link) do
    ctx = Context.merge_link(ctx, link)

    case do_execute_liquid(template, ctx) do
      {:error, error} -> {:error, error}
      destination -> {:ok, destination}
    end
  end

  def evaluate(_, _), do: {:error, "expected Liquid link"}

  defp do_execute_liquid(template, ctx) do
    with {:ok, doc} <- Liquex.parse(template) do
      {pieces, _ctx} = Liquex.render!(doc, ctx)

      pieces |> List.flatten() |> Enum.join()
    end
  rescue
    _ ->
      {:error, "Invalid Liquid template"}
  end
end
