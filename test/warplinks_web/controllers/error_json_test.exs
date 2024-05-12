defmodule WarplinksWeb.ErrorJSONTest do
  use WarplinksWeb.ConnCase, async: true

  test "renders 404" do
    assert WarplinksWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500" do
    assert WarplinksWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
