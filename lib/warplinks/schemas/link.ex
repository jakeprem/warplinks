defmodule Warplinks.Link do
  use Ecto.Schema
  import Ecto.Changeset

  schema "links" do
    field :name, :string
    field :key, :string
    field :type, Ecto.Enum, values: [:basic, :lua, :liquid], default: :basic

    field :destination, :string
    field :template, :string
    field :data, :map

    field :description, :string
    field :views, :integer, default: 0

    timestamps()
  end

  @doc false
  def changeset(link, attrs) do
    link
    |> cast(attrs, [:name, :key, :type, :destination, :template, :data, :description, :views])
    |> validate_required([:name, :destination, :key])
    |> unique_constraint(:key)
  end

  def after_insert(%__MODULE__{} = link, _changeset) do
    Warplinks.LinkServer.add_link(link)

    link
  end
end
