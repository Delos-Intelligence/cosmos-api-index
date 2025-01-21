// pages/api/embed/[indexUuid].ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { indexUuid } = req.query;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/index/embed/${indexUuid}`,
    {
      method: "POST",
    },
  );

  if (response.ok) {
    res.status(200).json({});
  } else {
    res.status(response.status).json({ error: "Failed to embed index" });
  }
}
