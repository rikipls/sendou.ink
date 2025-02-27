import { useMatches } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Button, LinkButton } from "~/components/Button";
import { Section } from "~/components/Section";
import { useUser } from "~/features/auth/core/user";
import { UserResultsTable } from "~/features/user-page/components/UserResultsTable";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import invariant from "~/utils/invariant";
import { userResultsEditHighlightsPage } from "~/utils/urls";
import type { UserPageLoaderData } from "../../../features/user-page/routes/u.$identifier";

export default function UserResultsPage() {
	const user = useUser();
	const { t } = useTranslation("user");
	const [, parentRoute] = useMatches();
	invariant(parentRoute);
	const userPageData = parentRoute.data as UserPageLoaderData;

	const highlightedResults = userPageData.results.filter(
		(result) => result.isHighlight,
	);
	const hasHighlightedResults = highlightedResults.length > 0;

	const [showAll, setShowAll] = useSearchParamState({
		defaultValue: !hasHighlightedResults,
		name: "all",
		revive: (v) => (!hasHighlightedResults ? true : v === "true"),
	});

	const resultsToShow = showAll ? userPageData.results : highlightedResults;

	return (
		<div className="stack lg">
			{user?.id === userPageData.id ? (
				<LinkButton
					to={userResultsEditHighlightsPage(user)}
					className="ml-auto"
					size="tiny"
				>
					{t("results.highlights.choose")}
				</LinkButton>
			) : null}
			<Section
				title={showAll ? t("results.title") : t("results.highlights")}
				className="u__results-table-wrapper"
			>
				<UserResultsTable id="user-results-table" results={resultsToShow} />
			</Section>
			{hasHighlightedResults ? (
				<Button
					variant="minimal"
					size="tiny"
					onClick={() => setShowAll(!showAll)}
				>
					{showAll
						? t("results.button.showHighlights")
						: t("results.button.showAll")}
				</Button>
			) : null}
		</div>
	);
}
