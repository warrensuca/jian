import Divider from "../components/ui/Divider";
import { Slider } from "@/app/components/shadcn/slider";

function MacroMatcher() {
  return (
    <div className="flex flex-col bg-background w-[80rem] px-[20rem]">
      <div className="flex flex-col px-[2rem] py-[3.5rem] max-w-[31.25rem] h-[17.0625rem] gap-[1rem]">
        <p className="text-sm text-[#4A7865]">TRACK 01 — MACRO MATCHER</p>

        <p className="text-5xl text-foreground">Fuel Your Flow.</p>

        <p className="text-sm text-muted-foreground text-wrap">
          Dial your macros. We surface the cluster that fits your fuel profile —
          then you pick the track.
        </p>
      </div>

      <div className="flex justify-evenly w-[60rem] ">
        <div className="flex flex-1 flex-col px-[0.5rem] gap-[2rem] px-[2rem] py-[2.5rem] border border-l-0 border-solid border-[#B8B8B8] border-1">
          <p className="text-sm text-muted-foreground">CONTROL PANEL</p>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Calories</p>
              <p className="text-xs text-accent">{`${200}kcals`}</p>
            </div>

            <Slider defaultValue={[200]} max={1000} step={1} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Protein</p>
              <p className="text-xs text-accent">{`${20}g`}</p>
            </div>

            <Slider defaultValue={[20]} max={100} step={1} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Carbohydrates</p>
              <p className="text-xs text-accent">{`${40}g`}</p>
            </div>

            <Slider defaultValue={[40]} max={200} step={1} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Fat</p>
              <p className="text-xs text-accent">{`${20}g`}</p>
            </div>

            <Slider defaultValue={[20]} max={100} step={1} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Saturated Fat</p>
              <p className="text-xs text-accent">{`${10}g`}</p>
            </div>

            <Slider defaultValue={[10]} max={50} step={1} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Sodium</p>
              <p className="text-xs text-accent">{`${500}mg`}</p>
            </div>

            <Slider defaultValue={[500]} max={2500} step={1} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Sugar</p>
              <p className="text-xs text-accent">{`${350}kcals`}</p>
            </div>

            <Slider defaultValue={[20]} max={100} step={1} />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-[0.5rem] gap-[2rem] px-[2rem] py-[2.5rem] rounded-border border-l-0 border-r-0 border-solid border-[#B8B8B8] border-1">
          <p className="text-sm text-muted-foreground">CLUSTER REVEAL</p>
          <div className="flex flex-col gap-[1rem]">
            <p className="text-sm text-[#4A7865]">MATCHED TO CLUSTER</p>

            <p className="text-3xl text-foreground">Balanced Carb-Mains.</p>

            <p className="text-sm text-muted-foreground text-wrap">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus
              odio molestiae saepe tenetur dignissimos deleniti optio sapiente
              minus blanditiis reiciendis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MacroMatcher;
