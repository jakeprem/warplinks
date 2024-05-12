defmodule Warplinks.Link do
  use Ecto.Schema
  import Ecto.Changeset

  schema "links" do
    field :name, :string
    field :destination, :string
    field :key, :string
    field :views, :integer, default: 0

    timestamps()
  end

  @doc false
  def changeset(link, attrs) do
    link
    |> cast(attrs, [:name, :destination, :key, :views])
    |> validate_required([:name, :destination, :key])
    |> unique_constraint(:key)
  end
end
