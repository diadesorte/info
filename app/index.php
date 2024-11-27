<?php

error_reporting(E_ERROR | E_PARSE);
// include __DIR__ . '/includes/rb.php';

class Info
{
  public $ip;
  public $path;
  public $referer;
  public $geolocation;

  public function __construct()
  {
    $this->ip = $_SERVER['REMOTE_ADDR'];
    $this->path = $_SERVER['REQUEST_URI'];
    $this->referer = $_SERVER['HTTP_REFERER'];
    $this->geolocation = $this->getGeolocation();

    // $info = R::dispense('info');
    // $info->ip = $this->ip;
    // $info->path = $this->path;
    // $info->referer = $this->referer;
    // $info->created_at = date('Y-m-d H:i:s');
    // R::store($info);
  }

  public function getGeolocation()
  {
    $self = $this;
    $r = new stdClass;

    $info = $this->cache('ipapi.co', 60 * 24, function () use ($self) {
      return $self->requestGet("https://ipapi.co/{$_SERVER['REMOTE_ADDR']}/json/", [
        'lat' => null,
        'lng' => null,
      ]);
    });

    $r->lat = $info->latitude;
    $r->lng = $info->longitude;

    $place = $this->cache('nominatim.openstreetmap.org/reverse', 60 * 24, function () use ($r, $self) {
      $place = $self->requestGet("https://nominatim.openstreetmap.org/reverse?format=json&lat={$r->lat}&lon={$r->lng}");
      $place->address = isset($place->address) ? $place->address : [];
      $place->address = (object) $place->address;
      return $place;
    });

    $r->city = $place->address->city ?? null;
    $r->state = $place->address->state ?? null;
    $r->state_code = null;
    $r->country = $place->address->country ?? null;
    $r->country_code = null;
    list($r->country_code, $r->state_code) = explode('-', $place->address->{'ISO3166-2-lvl4'});

    return $r;
  }

  public function requestGet($url, $default = [])
  {
    $data = file_get_contents($url);
    $data = json_decode($data, true);
    $data = is_array($data) ? $data : [];
    return (object) array_merge($default, $data);
  }

  public function cache($key, $minutes, $callback)
  {
    $cache_dir = __DIR__ . '/.cache';
    $cache_file = $cache_dir . "/{$key}";

    if (!file_exists($cache_dir)) mkdir($cache_dir, 0777, true);

    if (!file_exists($cache_file)) {
      $content = call_user_func($callback);
      file_put_contents($cache_file, json_encode([
        'expire_at' => time() + ($minutes * 60),
        'content' => base64_encode(serialize($content)),
      ]));
    }

    $cache = json_decode(file_get_contents($cache_file));

    if (time() > $cache->expire_at) {
      $content = call_user_func($callback);
      file_put_contents($cache_file, json_encode([
        'expire_at' => time() + ($minutes * 60),
        'content' => base64_encode(serialize($content)),
      ]));
      return $content;
    }

    return unserialize(base64_decode($cache->content));
  }

  public function dd($data)
  {
    echo '<pre>' . print_r($data, true) . '</pre>';
  }
}

$info = new Info();

// echo '<pre>', print_r($info, true), '</pre>';
// echo '<pre>', print_r($_SERVER, true), '</pre>';

?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <a href="/uniqid/<?php echo uniqid(); ?>">next</a>

  <script>
    let info = <?php echo json_encode($info); ?>;
    // info.referrer = document.referrer;
    console.log(JSON.stringify(info, null, 2));
  </script>
</body>

</html>