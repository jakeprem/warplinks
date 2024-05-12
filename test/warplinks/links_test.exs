defmodule Warplinks.LinksTest do
  use Warplinks.DataCase

  alias Warplinks.Links

  describe "get_by_key/1" do
    test "returns the link with the given key" do
      link = Links.create_link!(%{key: "test", destination: "http://example.com", name: "Test"})

      assert link == Links.get_by_key(link.key)
    end

    test "returns nil if the link is not found" do
      assert Links.get_by_key("not_found") == nil
    end
  end
end
