defmodule Warplinks.Repo.Migrations.CreateLinksTable do
  use Ecto.Migration

  def change do
    create table(:links) do
      add :key, :string
      add :name, :string
      add :destination, :string
      add :views, :integer, default: 0

      timestamps()
    end

    create unique_index(:links, [:key])
  end
end
