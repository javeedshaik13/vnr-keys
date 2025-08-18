import { useState } from "react";
import FavoritesSection from "./FavoritesSection";
import DepartmentAccordion from "./DepartmentAccordion";

const AllKeysSection = ({
	keys,
	searchQuery,
	availabilityFilter,
	onRequestKey,
	onToggleFrequent,
}) => {
	const [openState, setOpenState] = useState({});
	return (
		<div>
			{/* Favorites */}
			<FavoritesSection
				keys={keys}
				searchQuery={searchQuery}
				availabilityFilter={availabilityFilter}
				onRequestKey={onRequestKey}
				onToggleFrequent={onToggleFrequent}
				limit={5}
			/>

			{/* All Keys by Department */}
			<div className="mt-2">
				<h3 className="text-lg font-semibold text-white mb-4">All Keys (By Department)</h3>
				<DepartmentAccordion
					keys={keys}
					searchQuery={searchQuery}
					availabilityFilter={availabilityFilter}
					onRequestKey={onRequestKey}
					onToggleFrequent={onToggleFrequent}
					openState={openState}
					setOpenState={setOpenState}
				/>
			</div>
		</div>
	);
};

export default AllKeysSection;


