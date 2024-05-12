defmodule Warplinks.Links do
  use EctoResource

  alias Warplinks.Link
  alias Warplinks.Repo

  using_repo(Repo) do
    resource(Link)
  end

  def change_link(link), do: change_link(link, %{})

  def get_by_key(key) do
    Repo.get_by(Link, key: key)
  end
end
