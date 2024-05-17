defmodule Warplinks.Links do
  use EctoResource

  alias Warplinks.Link
  alias Warplinks.Repo
  alias WarplinksWeb.Endpoint

  using_repo(Repo) do
    resource(Link, except: [:create])
  end

  def create_link(attrs) do
    create_changeset = Link.changeset(%Link{}, attrs)

    with {:ok, link} <- Repo.insert(create_changeset) do
      Endpoint.broadcast("links", "created", %{"id" => link.id})
      {:ok, link}
    end
  end

  def change_link(link), do: change_link(link, %{})

  def get_by_key(key) do
    Repo.get_by(Link, key: key)
  end
end
