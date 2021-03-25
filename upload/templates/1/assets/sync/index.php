<?php
require_once('{{APP_PATH}}autoload.php');
header('Content-Type: application/json; charset=utf-8');
$input = json_decode(file_get_contents('php://input'), true);
$actions = [
    'setMeta',
    'setPublication',
    'deLPublication'
];
if (empty($input)
    || !isset($input['auth'])
    || $input['auth']!='8fea39d82cfaae83ed954e7f8e821a3c981c6e854ad2155fc2a86f7d01a8fa52') {
    print(json_encode('no auth'));
    exit;
}
if (!isset($input['action']) || !in_array($input['action'], $actions)) {
    print(json_encode('unknown action'));
    exit;
}
if (empty($input['param']) ||!is_array($input['param'])) {
    print(json_encode('empty data'));
    exit;
}
$action = $input['action'];
if ($action == 'setMeta') {
    $data = $input['param'];
    if (!isset($data['gist']) || !isset($data['data'])) {
        print(json_encode('bad data'));
        exit;
    }
    try {
        (new \classes\models\Site())->setMeta($data['gist'], ($data['data']));
    } catch (Exception $e) {
        print(json_encode($e->getMessage()));
        exit;
    }
} elseif ($action == 'setPublication') {
    $data = $input['param'];
    file_put_contents('new_publ.log', print_r($data, true));
    try {
        (new \classes\models\Publications())->jsonToBase($data);
    } catch (Exception $e) {
        print(json_encode($e->getMessage()));
        exit;
    }
} elseif ($action == 'delPublication') {
    $data = $input['param'];
    if (!isset($data['id'])) {
        print(json_encode('bad data'));
        exit;
    }
    $id = $data['id'];
    try {
        (new \classes\models\Publications())->delPublications($id);
    } catch (Exception $e) {
        print(json_encode($e->getMessage()));
        exit;
    }
}
print(json_encode('success'));
exit;
