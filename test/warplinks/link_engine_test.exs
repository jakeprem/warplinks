defmodule Warplinks.LinkEngineTest do
  use Warplinks.DataCase

  alias Warplinks.Link
  alias Warplinks.LinkEngine
  # alias Warplinks.Repo

  describe "build_redirect_url/2" do
    test "builds a redirect URL from a link and a path" do
      link = %Link{destination: "http://example.com/%s"}
      path = ["foo", "bar"]

      assert LinkEngine.build_redirect_url(link, path) == "http://example.com/foo"
    end
  end

  # TODO: Setup factory and uncomment these tests
  # describe "increment_views_async/1" do
  #   test "starts a task to increment the views of a link" do
  #     link = %Link{views: 0}

  #     LinkEngine.increment_views_async(link)

  #     assert Repo.get(Link, link.id).views == 1
  #   end
  # end

  # describe "increment_views/1" do
  #   test "increments the views of a link" do
  #     link = %Link{views: 0}

  #     LinkEngine.increment_views(link)

  #     assert Repo.get(Link, link.id).views == 1
  #   end
  # end
end
