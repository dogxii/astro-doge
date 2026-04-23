import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE } from "@consts";

type Context = {
	site: string;
};

export async function GET(context: Context) {
	const blog = (await getCollection("posts")).filter(
		(post) => !post.data.draft,
	);

	const items = [...blog].sort(
		(a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
	);

	return rss({
		title: SITE.NAME,
		description: SITE.DESCRIPTION,
		site: context.site,
		items: items.map((item) => ({
			title: item.data.title,
			description: item.data.description,
			pubDate: item.data.date,
			link: `/${item.data.slug || item.id}/`,
		})),
	});
}
