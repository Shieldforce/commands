<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Api\StoreCommandRequest;
use App\Http\Requests\Api\UpdateCommandRequest;
use App\Models\Command;

class CommandController
{
    public function index(string $group = null)
    {
        $list = [];
        $commands = Command::get(["id", "title", "description", "group"]);
        if ($group) {
            $commands = Command::where("group", $group)
                ->get(["id", "title", "description", "group"]);
        }

        foreach ($commands as $command) {
            $id = str_pad($command->id , 3 , '0' , STR_PAD_LEFT);;
            $list[$command->group][] =
                "[".$id."] : (".$command->title.") = [".$command->description."]";
        }

        if(app()->runningInConsole()) {
            return json_encode(
                $list,
                JSON_PRETTY_PRINT
            );
        }

        return response()->json($list);
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
