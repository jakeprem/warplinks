defmodule Warplinks.Repo do
  use EctoHooks.Repo,
    otp_app: :warplinks,
    adapter: Ecto.Adapters.SQLite3
end
