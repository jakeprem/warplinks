defmodule Warplinks.PubSub do
  def subscribe(topic) do
    Phoenix.PubSub.subscribe(Warplinks.PubSub, topic)
  end

  def broadcast(topic, event, payload) do
    Phoenix.PubSub.broadcast(Warplinks.PubSub, topic, {event, payload})
  end
end
