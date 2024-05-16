# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Warplinks.Repo.insert!(%Warplinks.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
alias Warplinks.Repo
alias Warplinks.Link

Enum.each(
  [
    %Link{
      key: "hex",
      name: "Hex Package search",
      destination: "https://hex.pm/packages?q=%s"
    },
    %Link{
      key: "ex",
      name: "Elixir Documentation Search",
      destination: "https://hexdocs.pm/elixir/search.html?q=%s"
    },
    %Link{
      key: "ask",
      name: "Ask ChatGPT",
      destination: "https://chatgpt.com/?q=%s&model=gpt-4o"
    },
    %Link{
      key: "prs",
      name: "PR Reviews Requested",
      template:
        "https://github.com/pulls?q=is:open+is:pr+review-requested:{% if captures.remaining.size > 0 %}{{ captures.remaining | join:' ' }}{% else %}@me{% endif %}+archived:false",
      type: :liquid
    },
    %Link{
      key: "prs/lua",
      name: "PR Reviews Requested (Lua)",
      template:
        "if ctx.captures.remaining and #ctx.captures.remaining > 0 then\n    local user = table.concat(ctx.captures.remaining, \"+\", 1)\n    return \"https://github.com/pulls?q=is:open+is:pr+review-requested:\" .. user .. \"+archived:false\"\nelse\n    return \"https://github.com/pulls?q=is:open+is:pr+review-requested:@me+archived:false\"\nend",
      type: :lua
    }
  ],
  &Repo.insert/1
)
