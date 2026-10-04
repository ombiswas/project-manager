import { CirclePlus, LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";

interface NoDataFoundProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonAction?: () => void;
}

export const NoDataFound = ({
  title,
  description,
  buttonText,
  buttonAction,
}: NoDataFoundProps) => {
  return (
    <div className="col-span-full text-center py-12 px-6 bg-[#1a1c20] border border-[#212327] rounded-[8px]">
      <LayoutGrid className="size-10 mx-auto text-[#7d8187] stroke-1" />
      <h3 className="mt-4 text-base font-normal text-white">{title}</h3>

      <p className="mt-2 text-sm font-normal text-[#7d8187] max-w-sm mx-auto">
        {description}
      </p>
      {buttonText && buttonAction && (
        <Button onClick={buttonAction} variant="outline" className="mt-5">
          <CirclePlus className="size-4 mr-2" />
          {buttonText}
        </Button>
      )}
    </div>
  );
};
