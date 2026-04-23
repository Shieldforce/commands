<?php

namespace App\Http\Controllers\Api;

use App\Enums\TypeRequestEnum;
use App\Http\Requests\Api\StoreCommandRequest;
use App\Http\Requests\Api\UpdateCommandRequest;
use App\Models\Command;

class CommandController
{
    private function isPrivileged(): bool
    {
        $roles = auth()->user()->roles->pluck('name')->toArray();
        return count(array_intersect($roles, ['SA', 'admin'])) > 0;
    }

    public function index(string $group = null, int $type = 1)
    {
        if ($group === 'all') {
            $group = null;
        }

        $query = Command::query();

        if (!$this->isPrivileged()) {
            $query->where('user_id', auth()->id());
        }

        if ($group) {
            $query->where('group', $group);
        }

        $commands = $query->get(['id', 'title', 'description', 'group', 'type']);

        $list = [];
        foreach ($commands as $command) {
            $id   = str_pad($command->id, 4, '0', STR_PAD_LEFT);
            $t    = $command->type ?? 'command';
            $list[$command->group][] =
                "[{$id}] : ({$command->title}) = [{$command->description}] {{$t}}";
        }

        ksort($list);

        if ($type == TypeRequestEnum::browser->value) {
            return response()->json($list);
        }

        return json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public function store(StoreCommandRequest $request)
    {
        $data            = $request->validated();
        $data['user_id'] = auth()->id();

        return json_encode(Command::create($data), JSON_PRETTY_PRINT);
    }

    public function update(UpdateCommandRequest $request, Command $command)
    {
        if (!$this->isPrivileged() && $command->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $command->update($request->validated());
            return json_encode($command, JSON_PRETTY_PRINT);
        } catch (\Exception $e) {
            return json_encode(['error' => $e->getMessage()], JSON_PRETTY_PRINT);
        }
    }

    public function delete(Command $command)
    {
        if (!$this->isPrivileged() && $command->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return json_encode($command->delete(), JSON_PRETTY_PRINT);
    }
}
