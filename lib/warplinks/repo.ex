defmodule Warplinks.Repo do
  use Ecto.Repo,
    otp_app: :warplinks,
    adapter: Ecto.Adapters.SQLite3
end
