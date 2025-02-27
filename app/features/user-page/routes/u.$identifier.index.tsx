import { Link, useMatches } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { Flag } from "~/components/Flag";
import { Image, WeaponImage } from "~/components/Image";
import { BattlefyIcon } from "~/components/icons/Battlefy";
import { DiscordIcon } from "~/components/icons/Discord";
import { TwitchIcon } from "~/components/icons/Twitch";
import { TwitterIcon } from "~/components/icons/Twitter";
import { YouTubeIcon } from "~/components/icons/YouTube";
import { BadgeDisplay } from "~/features/badges/components/BadgeDisplay";
import { modesShort } from "~/modules/in-game-lists";
import invariant from "~/utils/invariant";
import type { SendouRouteHandle } from "~/utils/remix";
import { rawSensToString } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import {
	modeImageUrl,
	navIconUrl,
	teamPage,
	topSearchPlayerPage,
	userSubmittedImage,
} from "~/utils/urls";
import type { UserPageLoaderData } from "./u.$identifier";

export const handle: SendouRouteHandle = {
	i18n: "badges",
};

export default function UserInfoPage() {
	const [, parentRoute] = useMatches();
	invariant(parentRoute);
	const data = parentRoute.data as UserPageLoaderData;

	return (
		<div className="u__container">
			<div className="u__avatar-container">
				<Avatar user={data} size="lg" className="u__avatar" />
				<div>
					<h2 className="u__name">
						<div>{data.username}</div>
						<div>
							{data.country ? <Flag countryCode={data.country} tiny /> : null}
						</div>
					</h2>
					<TeamInfo />
				</div>
				<div className="u__socials">
					{data.twitch ? (
						<SocialLink type="twitch" identifier={data.twitch} />
					) : null}
					{data.twitter ? (
						<SocialLink type="twitter" identifier={data.twitter} />
					) : null}
					{data.youtubeId ? (
						<SocialLink type="youtube" identifier={data.youtubeId} />
					) : null}
					{data.battlefy ? (
						<SocialLink type="battlefy" identifier={data.battlefy} />
					) : null}
				</div>
			</div>
			<ExtraInfos />
			<WeaponPool />
			<TopPlacements />
			<BadgeDisplay badges={data.badges} key={data.id} />
			{data.bio && <article>{data.bio}</article>}
		</div>
	);
}

function TeamInfo() {
	const [, parentRoute] = useMatches();
	invariant(parentRoute);
	const { team } = parentRoute.data as UserPageLoaderData;

	if (!team) return null;

	return (
		<Link to={teamPage(team.customUrl)} className="u__team">
			{team.avatarUrl ? (
				<img
					alt=""
					src={userSubmittedImage(team.avatarUrl)}
					width={24}
					height={24}
					className="rounded-full"
				/>
			) : null}
			{team.name}
		</Link>
	);
}

interface SocialLinkProps {
	type: "youtube" | "twitter" | "twitch" | "battlefy";
	identifier: string;
}

export function SocialLink({
	type,
	identifier,
}: {
	type: "youtube" | "twitter" | "twitch" | "battlefy";
	identifier: string;
}) {
	const href = () => {
		switch (type) {
			case "twitch":
				return `https://www.twitch.tv/${identifier}`;
			case "twitter":
				return `https://www.twitter.com/${identifier}`;
			case "youtube":
				return `https://www.youtube.com/channel/${identifier}`;
			case "battlefy":
				return `https://battlefy.com/users/${identifier}`;
			default:
				assertUnreachable(type);
		}
	};

	return (
		<a
			className={clsx("u__social-link", {
				youtube: type === "youtube",
				twitter: type === "twitter",
				twitch: type === "twitch",
				battlefy: type === "battlefy",
			})}
			href={href()}
		>
			<SocialLinkIcon type={type} />
		</a>
	);
}

function SocialLinkIcon({ type }: Pick<SocialLinkProps, "type">) {
	switch (type) {
		case "twitch":
			return <TwitchIcon />;
		case "twitter":
			return <TwitterIcon />;
		case "youtube":
			return <YouTubeIcon />;
		case "battlefy":
			return <BattlefyIcon />;
		default:
			assertUnreachable(type);
	}
}

function ExtraInfos() {
	const { t } = useTranslation(["user"]);
	const [, parentRoute] = useMatches();
	invariant(parentRoute);
	const data = parentRoute.data as UserPageLoaderData;

	const motionSensText =
		typeof data.motionSens === "number"
			? `${t("user:motion")} ${rawSensToString(data.motionSens)}`
			: null;

	const stickSensText =
		typeof data.stickSens === "number"
			? `${t("user:stick")} ${rawSensToString(data.stickSens)}`
			: null;

	if (
		!data.inGameName &&
		typeof data.stickSens !== "number" &&
		!data.discordUniqueName &&
		!data.plusTier
	) {
		return null;
	}

	return (
		<div className="u__extra-infos">
			{data.discordUniqueName && (
				<div className="u__extra-info">
					<span className="u__extra-info__heading">
						<DiscordIcon />
					</span>{" "}
					{data.discordUniqueName}
				</div>
			)}
			{data.inGameName && (
				<div className="u__extra-info">
					<span className="u__extra-info__heading">{t("user:ign.short")}</span>{" "}
					{data.inGameName}
				</div>
			)}
			{typeof data.stickSens === "number" && (
				<div className="u__extra-info">
					<span className="u__extra-info__heading">{t("user:sens")}</span>{" "}
					{[motionSensText, stickSensText].filter(Boolean).join(" / ")}
				</div>
			)}
			{data.plusTier && (
				<div className="u__extra-info">
					<Image path={navIconUrl("plus")} width={20} height={20} alt="" />{" "}
					{data.plusTier}
				</div>
			)}
		</div>
	);
}

function WeaponPool() {
	const [, parentRoute] = useMatches();
	invariant(parentRoute);
	const data = parentRoute.data as UserPageLoaderData;

	if (data.weapons.length === 0) return null;

	return (
		<div className="stack horizontal sm justify-center">
			{data.weapons.map((weapon, i) => {
				return (
					<div key={weapon.weaponSplId} className="u__weapon">
						<WeaponImage
							testId={`${weapon.weaponSplId}-${i + 1}`}
							weaponSplId={weapon.weaponSplId}
							variant={weapon.isFavorite ? "badge-5-star" : "badge"}
							width={38}
							height={38}
						/>
					</div>
				);
			})}
		</div>
	);
}

function TopPlacements() {
	const [, parentRoute] = useMatches();
	invariant(parentRoute);
	const data = parentRoute.data as UserPageLoaderData;

	if (!data.playerId) return null;

	return (
		<Link
			to={topSearchPlayerPage(data.playerId)}
			className="u__placements"
			data-testid="placements-box"
		>
			{modesShort.map((mode) => {
				const placement = data.topPlacements[mode];

				if (!placement) return null;

				return (
					<div key={mode} className="u__placements__mode">
						<Image path={modeImageUrl(mode)} alt="" width={24} height={24} />
						<div>
							{placement.rank} / {placement.power}
						</div>
					</div>
				);
			})}
		</Link>
	);
}
