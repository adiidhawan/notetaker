"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type Tag = {
  id: string;
  name: string;
};

export default function TagManager() {
  const { data: session } = useSession();
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    if (session) {
      fetchTags();
    }
  }, [session]);

  const fetchTags = async () => {
    const response = await fetch("/api/tags");
    if (response.ok) {
      const data = await response.json();
      setTags(data);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName }),
    });

    if (response.ok) {
      const newTag = await response.json();
      setTags([...tags, newTag]);
      setNewTagName("");
    }
  };

  if (!session) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Tags</h3>
      <form onSubmit={handleCreateTag} className="mb-4">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name"
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Tag
        </button>
      </form>
      <ul className="list-disc pl-5">
        {tags.map((tag) => (
          <li key={tag.id}>{tag.name}</li>
        ))}
      </ul>
    </div>
  );
}
