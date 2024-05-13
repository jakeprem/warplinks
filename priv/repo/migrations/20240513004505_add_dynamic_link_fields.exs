defmodule Warplinks.Repo.Migrations.AddDynamicLinkFields do
  use Ecto.Migration

  def change do
    alter table(:links) do
      add :type, :string
      add :template, :string
      add :data, :map

      add :description, :string
    end
  end
end
