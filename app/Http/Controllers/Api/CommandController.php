<?php

namespace App\Http\Controllers\Api;

use App\Enums\TypeRequestEnum;
use App\Http\Requests\Api\StoreCommandRequest;
use App\Http\Requests\Api\UpdateCommandRequest;
use App\Models\Command;

class CommandController
{
    public function index(
        string $group = null,
        int $type = 1
    )
    {
        if($group == "all") {
            $group = null;
        }

        $list = [];
        $commands = Command::get(["id", "title", "description", "group"]);
        if ($group) {
            $commands = Command::where("group", $group)
                ->get(["id", "title", "description", "group"]);
        }

        foreach ($commands as $command) {
            $id = str_pad($command->id , 4 , '0' , STR_PAD_LEFT);;
            $list[$command->group][] =
                "[".$id."] : (".$command->title.") = [".$command->description."]";
        }

        ksort($list);

        if($type == TypeRequestEnum::browser->value) {
            return response()->json($list);
        }

        return json_encode(
            $list,
            JSON_PRETTY_PRINT
        );
    }

    public function store(StoreCommandRequest $request)
    {
        return json_encode(
            Command::create($request->validated()),
            JSON_PRETTY_PRINT
        );
    }

    public function update(UpdateCommandRequest $request, Command $command)
    {
        try {
            $command->update($request->validated());
            return json_encode(
                $command,
                JSON_PRETTY_PRINT
            );
        } catch (\Exception $exception) {
            return json_encode(
                $exception,
                JSON_PRETTY_PRINT
            );
        }
    }

    public function delete(Command $command)
    {
        return json_encode(
            /*$command->delete()*/ true,
            JSON_PRETTY_PRINT
        );
    }
}
