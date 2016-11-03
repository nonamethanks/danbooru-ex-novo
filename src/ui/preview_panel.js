import ModeMenu from "./mode_menu.js";

export default class PreviewPanel {
  static initialize() {
    // This is the main content panel that comes before the preview panel.
    let $content = $(`
      #c-posts #content,
      #c-notes #a-index,
      #c-pools #a-gallery,
      #c-pools #a-show,
      #c-comments #a-index,
      #c-moderator-post-queues #a-show,
      #c-users #a-show
    `);

    if ($content.length === 0) {
      return;
    }

    $content.parent().addClass("ex-preview-panel-container");
    $content.addClass("ex-content-panel");
    $content.after(`
      <section id="ex-preview-panel-resizer" class="ex-vertical-resizer">
        <div class="ex-vertical-resizer-line"></div>
      </section>
      <section id="ex-preview-panel" class="ex-panel">
        <div>
          <article>
            No image selected. Click a thumbnail to open image preview.
          </article>
        </div>
      </section>
    `);

    const width = EX.config.previewPanelState[EX.config.pageKey()] || EX.config.defaultPreviewPanelWidth;
    PreviewPanel.origTop = $("#ex-preview-panel > div").offset().top;
    PreviewPanel.setWidth(width);
    PreviewPanel.setHeight();
    PreviewPanel.save();

    if (ModeMenu.getMode() === "view") {
      $("#ex-preview-panel").hide();
    }

    $(document).scroll(_.throttle(PreviewPanel.setHeight, 16));
    $('.ex-mode-menu select[name="mode"]').change(PreviewPanel.switchMode);
    $("#ex-preview-panel-resizer").draggable({
      axis: "x",
      helper: "clone",
      drag: _.throttle(PreviewPanel.resize, 16),
      stop: _.debounce(PreviewPanel.save, 100),
    });
  }

  static resize(e, ui) {
    // XXX magic number
    PreviewPanel.setWidth($("body").innerWidth() - ui.position.left - 28);
  }

  static save() {
    let state = EX.config.previewPanelState;
    state[EX.config.pageKey()] = $("#ex-preview-panel").width();
    EX.config.previewPanelState = state;
  };

  static open() {
    $("#ex-preview-panel").show({ effect: "slide", direction: "left" }).promise().then((e) => {
      PreviewPanel.save();
    });
  }

  static close() {
    $("#ex-preview-panel").hide({ effect: "slide", direction: "right" }).promise().then((e) => {
      PreviewPanel.save();
    });
  }

  static switchMode() {
    if (ModeMenu.getMode() === "view") {
      PreviewPanel.close();
    } else {
      PreviewPanel.open();
    }
  }

  static setWidth(width) {
    $("#ex-preview-panel").width(width);
    $("#ex-preview-panel > div").width(width);
  }

  static setHeight() {
    const headerHeight = $("#ex-header").outerHeight(true);
    const footerHeight = $("footer").outerHeight(true);

    let height;
    if (window.scrollY + headerHeight >= PreviewPanel.origTop) {
      $("#ex-preview-panel > div").addClass("ex-fixed").css({ top: headerHeight });
      height = `calc(100vh - ${headerHeight}px)`;
    } else {
      $("#ex-preview-panel > div").removeClass("ex-fixed");
      height = `calc(100vh - ${PreviewPanel.origTop - window.scrollY}px)`;
    }

    const diff = window.scrollY + window.innerHeight + footerHeight - $("body").height();
    if (diff >= 0) {
      height = `calc(100vh - ${headerHeight}px - ${diff}px)`;
    }

    $("#ex-preview-panel > div").css({ height });
    $("#ex-preview-panel > div > article.post-preview img").css({ "max-height": height });
  }
}