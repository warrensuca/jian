import { RecipeCardType } from "@/types";

function RecipeCard(props: RecipeCardType) {
    return (
        <div className="flex flex-col w-[20rem] gap-[0.5rem] p-[1.25rem] bg-[#ffffff] rounded-[0.25rem] border border-1px border-[#B8B8B8]">
            
            <h3 className="text-foreground">
                {props.name}
            </h3>

            <div className="flex py-[0.5rem] gap-[0.375rem]">
                {
                    props.macros.map((record: Record<string, number>, index: number) => {
                        const entries = Object.entries(record);
                        return entries.map(([key, value]) => {
                            return (
                                <div key = {index} className="text-[0.6rem] text-nowrap px-[0.5rem] py-[0.125rem] border border-px border-[#D9D2C7]">
                                    <p key={`${index}-${key}`} className="text-cs">
                                        [ {key}: {value} ]
                                    </p>
                                </div>
                            ); 
                        });
                    })
                }
            </div>

            <div className="border border-[#4A7865] px-[0.625rem] py-[0.25rem] rounded-full">
                <p className="text-[#4A7865] text-xs">
                    {props.clusterName}
                </p>
                
            </div>
        </div>
    )
}
export default RecipeCard;
