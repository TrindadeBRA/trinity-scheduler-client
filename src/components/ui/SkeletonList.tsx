import { Skeleton } from "./Skeleton";

interface SkeletonListProps {
  count: number;
  itemClassName?: string;
}

export function SkeletonList({ count, itemClassName }: SkeletonListProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={itemClassName} />
      ))}
    </>
  );
}
